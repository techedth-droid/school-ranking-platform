import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/** หน้าแอดมินระบบที่ไม่ต้องล็อกอิน */
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];

/** หน้าโรงเรียนที่สาธารณะ (ไม่ต้องล็อกอิน) */
const PUBLIC_SCHOOL_PATHS = ['/school/register'];

function isPublicAdminPath(pathname) {
  return PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPublicSchoolPath(pathname) {
  return PUBLIC_SCHOOL_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

async function readAccessPayload(request) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (isPublicAdminPath(pathname)) {
      return NextResponse.next();
    }
    const payload = await readAccessPayload(request);
    if (!payload) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (payload.role === 'ADMIN') {
      return NextResponse.next();
    }
    if (payload.role === 'SCHOOL_ADMIN') {
      return NextResponse.redirect(new URL('/school/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (pathname.startsWith('/school')) {
    if (isPublicSchoolPath(pathname)) {
      return NextResponse.next();
    }
    const payload = await readAccessPayload(request);
    if (!payload) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (payload.role === 'SCHOOL_ADMIN') {
      return NextResponse.next();
    }
    if (payload.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/school', '/school/:path*'],
};
