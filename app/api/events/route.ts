import {NextRequest, NextResponse} from "next/server";
import {connectToDatabase} from "@/lib/mongodb";
import {Event} from "@/database/event.model";
import {v2 as cloudinary} from 'cloudinary'


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

        const file = formData.get('image') as File;

        if(!file){
            return NextResponse.json({'message': 'Image is required'},{status:400});
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {

            const uploadStream = cloudinary.uploader.upload_stream({resource_type:'image',folder:'DevEvent'},(error,result) => {
                    if(error){
                        reject(error);
                    }else{
                        resolve(result);
                    }
                }
            );
            uploadStream.end(buffer);
        })



        event.image = (uploadResult as {secure_url:string}).secure_url;


        const createdEvent = await Event.create(event);

        return NextResponse.json({message:"Event Created Successfully", event: createdEvent}, {status:201});

    }catch (e) {
        console.log(e);
        return NextResponse.json({error: e instanceof Error ? e.message : 'Unknown', message: 'Event Creation Failed'},{status:500});
    }
}

export async function GET(){

    try {
        await connectToDatabase();
        const events = await Event.find().sort({createdAt: -1});
        return NextResponse.json({message:'Event fetched successfully', events}, {status:200});

    }catch (e) {
        console.error(e);
        return NextResponse.json({message:'Event fetching failed',error:e},{status:500});

    }
}