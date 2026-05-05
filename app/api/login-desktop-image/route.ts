import { promises as fs } from "fs"

const LOGIN_DESKTOP_IMAGE_PATH =
  "C:\\Users\\PC\\.cursor\\projects\\c-Users-PC-Desktop-PointOfSale\\assets\\c__Users_PC_AppData_Roaming_Cursor_User_workspaceStorage_a69f669537b030635fe3bca302e20676_images_image-455b1b44-27b1-47f0-995d-1ce546dd53e1.png"

export async function GET() {
  try {
    const fileBuffer = await fs.readFile(LOGIN_DESKTOP_IMAGE_PATH)
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch {
    return new Response("Image not found", { status: 404 })
  }
}
