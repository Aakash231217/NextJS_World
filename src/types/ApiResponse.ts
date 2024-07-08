import { Message } from "@/model/User";

export interface ApiResponse{
    success: boolean;
    message:String;
    isAcceptingMessages?:boolean;
    messages?:Array<Message>

}