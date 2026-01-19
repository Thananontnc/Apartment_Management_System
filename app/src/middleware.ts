import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        "/",
        "/apartments/:path*",
        "/utilities/:path*",
        "/billing/:path*",
    ],
};
