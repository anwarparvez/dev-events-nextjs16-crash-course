import {NextRequest, NextResponse} from "next/server";
import {isInstanceOf} from "@posthog/core";
import {connectToDatabase} from "@/lib/mongodb";
import {Event} from "@/database/event.model";


export async function POST(req:NextRequest){
    try {

        await connectToDatabase();
        
        const formData = await req.formData();
        
        let event;
        
        try {
            event = Object.fromEntries(formData.entries());
        }catch (e) {
            return NextResponse.json({message: 'Invalid Jason Data format'},{status:400});
        }

        const createdEvent = await Event.create(event);
    }catch (e) {
        console.log(e);
        return NextResponse.json({error: e instanceof Error ? e.message : 'Unknown', message: 'Event Creation Failed'},{status:500});
    }
}