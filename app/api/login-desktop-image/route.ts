export async function GET(request: Request) {
  return Response.redirect(new URL("/lindabiz-desktop-preview.svg", request.url), 307)
}
