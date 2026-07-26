import { jwtDecode } from "jwt-decode";
import { NextRequest, NextResponse } from "next/server";
import { AccessDto } from "./../shared/accessdto";
import { JsonDto } from "../shared/jsondto";
import jwt from "jsonwebtoken";
import { cookieKeys } from "./constants/cookieKeys";
import { post } from "./lib/helpers/fetch";

const isTokenExpiredOrMissing = (token: string | undefined): boolean => {
  if (!token) {
    return true;
  }

  try {
    const decoded = jwtDecode<{ exp: number }>(token);

    if (!decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

const reauth = (request: NextRequest) => {
  const response = NextResponse.redirect(new URL("/auth", request.url));
  if (request.cookies.has(cookieKeys.accessToken)) {
    response.cookies.delete(cookieKeys.accessToken);
  }
  if (request.cookies.has(cookieKeys.passkey)) {
    response.cookies.delete(cookieKeys.passkey);
  }
  if (request.cookies.has(cookieKeys.email)) {
    response.cookies.delete(cookieKeys.email);
  }
  return response;
};

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Ignored Paths
  const ignoredRoutes = /\.(svg|png|jpg|jpeg|gif|webp|webm|ico|json|txt|pdf)$/i.test(pathname);
  if (ignoredRoutes) {
    return NextResponse.next();
  }

  const cookieEmail = request.cookies.get(cookieKeys.email)?.value;
  const cookieAccessToken = request.cookies.get(cookieKeys.accessToken)?.value;
  const cookiePasskey = request.cookies.get(cookieKeys.passkey)?.value;
  let shouldRedirect = false;

  // Auth Page - Ignore if no token, redirect to daily if token
  if (pathname.startsWith("/auth")) {
    if (!cookieAccessToken && !cookieEmail && !cookiePasskey) {
      return NextResponse.next();
    }

    if (cookieAccessToken) {
      try {
        // Will throw error if invalid token
        const decodedToken = jwt.verify(cookieAccessToken, process.env.JWT_SECRET_KEY!);
      } catch (error) {
        console.log(error);
        return reauth(request);
      }

      return NextResponse.redirect(new URL("/", request.url));
    }

    if (cookieEmail && cookiePasskey) {
      shouldRedirect = true;
    }
  }

  if (!cookiePasskey || !cookieEmail) {
    return reauth(request);
  }

  try {
    let res;
    if (shouldRedirect) {
      res = NextResponse.redirect(new URL("/", request.url));
    } else {
      res = NextResponse.next();
    }

    if (cookieAccessToken) {
      // Will throw error if invalid token
      const decodedToken = jwt.verify(cookieAccessToken, process.env.JWT_SECRET_KEY!, {
        ignoreExpiration: true,
      });
    }

    // Silent Reauth if needed
    if (isTokenExpiredOrMissing(cookieAccessToken)) {
      const decodedEmail = jwt.verify(cookieEmail, process.env.JWT_SECRET_KEY!) as { email: string };
      const decodedPasskey = jwt.verify(cookiePasskey, process.env.JWT_SECRET_KEY!) as { passkey: string };
      const email = decodedEmail.email;
      const passkey = decodedPasskey.passkey;

      const accessTokenBody: AccessDto = { email: email, passkey: passkey };
      const response = (await post("/auth/accessToken", accessTokenBody)) as JsonDto<AccessDto>;

      if (response.error || !response.data || !response.data.accessToken || !response.data.passkey) {
        throw new Error("Server Error");
      }

      const emailtoken = jwt.sign({ email: email }, process.env.JWT_SECRET_KEY!, { expiresIn: "180d" });
      const passkeyToken = jwt.sign({ passkey: response.data.passkey }, process.env.JWT_SECRET_KEY!, { expiresIn: "180d" });

      res.cookies.set(cookieKeys.accessToken, response.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 Day
      });
      res.cookies.set(cookieKeys.email, emailtoken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 180, // 180 Days
        path: "/",
      });
      res.cookies.set(cookieKeys.passkey, passkeyToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 180, // 180 Days
      });
    }

    return res;
  } catch (error) {
    console.log(error);
    return reauth(request);
  }
};

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
