import { promises as fs } from "fs"

const HERO_IMAGE_PATH =
  "C:\\Users\\PC\\.cursor\\projects\\c-Users-PC-Desktop-PointOfSale\\assets\\c__Users_PC_AppData_Roaming_Cursor_User_workspaceStorage_a69f669537b030635fe3bca302e20676_images_image-459242a9-cb3b-44d2-a96d-de2329f6ef4c.png"

export async function GET() {
  try {
    const fileBuffer = await fs.readFile(HERO_IMAGE_PATH)
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
