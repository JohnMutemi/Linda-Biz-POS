import { promises as fs } from "fs"

const LANDING_DESKTOP_IMAGE_PATH =
  "C:\\Users\\PC\\.cursor\\projects\\c-Users-PC-Desktop-PointOfSale\\assets\\c__Users_PC_AppData_Roaming_Cursor_User_workspaceStorage_a69f669537b030635fe3bca302e20676_images_image-4058ad4d-b463-4e5f-beac-ebe9355e87bc.png"

export async function GET() {
  try {
    const fileBuffer = await fs.readFile(LANDING_DESKTOP_IMAGE_PATH)
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch {
    return new Response("Image not found", { status: 404 })
  }
}
