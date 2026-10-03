import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { appState } from "../../../db/schema";

export async function GET(){try{const db=getDb();const [row]=await db.select().from(appState).where(eq(appState.id,1)).limit(1);return Response.json({state:row?JSON.parse(row.payload):null,updatedAt:row?.updatedAt??null});}catch(error){return Response.json({error:error instanceof Error?error.message:"טעינת הנתונים נכשלה"},{status:500});}}
export async function PUT(request:Request){try{const state=await request.json();if(!state||!Array.isArray(state.books)||!Array.isArray(state.members))return Response.json({error:"מבנה נתונים לא תקין"},{status:400});const payload=JSON.stringify(state);if(payload.length>2_500_000)return Response.json({error:"הנתונים גדולים מדי"},{status:413});const db=getDb();await db.insert(appState).values({id:1,payload,updatedAt:new Date().toISOString()}).onConflictDoUpdate({target:appState.id,set:{payload,updatedAt:new Date().toISOString()}});return Response.json({ok:true,updatedAt:new Date().toISOString()});}catch(error){return Response.json({error:error instanceof Error?error.message:"שמירת הנתונים נכשלה"},{status:500});}}
