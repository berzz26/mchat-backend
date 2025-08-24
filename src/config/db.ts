import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

// const addUser = async () => {
//     await prisma.user.create({
//         data: {
//             username: "testUser"
//         }
//     })
// }

// addUser()
