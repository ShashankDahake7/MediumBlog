import { useEffect, useState } from "react"
import axios from "axios";
import { BACKEND_URL } from "../config";


export interface Blog {
    "title": string;
    "content": string;
    "id": string
    "author": {
        "name": string
    }
}

export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Blog>();

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        }).then(response => {
            setPosts(response.data.posts);
            setLoading(false);
        })
    }, [id])

    return {
        loading,
        posts
    }

}
export const useBlogs = () => {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Blog[]>([]);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/blog/bulk`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        }).then(response => {
            setPosts(response.data.posts);
            setLoading(false);
        })
    }, [])

    return {
        loading,
        posts
    }
}