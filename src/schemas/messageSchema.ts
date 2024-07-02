import {z} from "zod";

export const messageSchema = ({
    content:z.string()
    .min(10,{message:"Content must be atleast 10 characters"})
    .max(400,{message:"Content must be no lonfer than 400 characters"})
})