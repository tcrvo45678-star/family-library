import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { copies, titles } from "../../../db/schema";

export async function GET(){
 try{const db=getDb();const rows=await db.select({id:titles.id,title:titles.title,author:titles.author,genre:titles.genre,cover:titles.coverKey,rating:titles.rating,owner:copies.ownerName,location:copies.location}).from(titles).leftJoin(copies,eq(copies.titleId,titles.id)).orderBy(desc(titles.createdAt));return Response.json({books:rows});}
 catch(error){return Response.json({error:error instanceof Error?error.message:"Database unavailable"},{status:500});}
}

export async function POST(request:Request){
 try{const body=await request.json() as {title?:string;author?:string;genre?:string;owner?:string;location?:string};if(!body.title?.trim()||!body.author?.trim()||!body.owner?.trim())return Response.json({error:"title, author and owner are required"},{status:400});const db=getDb();const [book]=await db.insert(titles).values({title:body.title.trim(),author:body.author.trim(),genre:body.genre?.trim()||"לא מסווג"}).returning();await db.insert(copies).values({titleId:book.id,ownerName:body.owner.trim(),location:body.location?.trim()||"הבית המשותף"});return Response.json({book},{status:201});}
 catch(error){return Response.json({error:error instanceof Error?error.message:"Save failed"},{status:500});}
}
