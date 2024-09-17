import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from 'hono/jwt'
import { createBlogInput, updateBlogInput } from "@100xdevs/medium-common"

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    },
    Variables: {
        userId: string
    }
}>()

blogRouter.use('/*', async (c, next) => {
    try {
        const authHeader = c.req.header("authorization") || "";
        // @ts-ignore
        const user = await verify(authHeader, c.env.JWT_SECRET);
        if (user) {
            // @ts-ignore
            c.set("userId", user.id);
            await next();
        } else {
            c.status(403);
            return c.json({ error: "Unauthorized" });
        }
    } catch (error) {
        console.error("Error during JWT verification:", error);
        c.status(500);
        return c.json({ error: "Internal Server Error" });
    }
});

blogRouter.post('/', async (c) => {
    // @ts-ignore
    const body = await c.req.json();
    const { success } = createBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs are not correct"
        })
    }
    const userId = c.get('userId');
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: userId
            }
        });
        return c.json({
            id: post.id
        });
    } catch (error) {
        console.error("Error occurred while creating post:", error);
        return c.json({ error: "An error occurred while creating post." }, 500);
    }
})

blogRouter.put('/', async (c) => {
    // @ts-ignore
    const body = await c.req.json();
    const { success } = updateBlogInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Inputs are not correct"
        })
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        await prisma.post.update({
            where: {
                id: body.id,
            },
            data: {
                title: body.title,
                content: body.content,
            }
        });
        return c.text('updated post');
    } catch (error) {
        console.error("Error occurred while updating post:", error);
        return c.text('Failed to update post');
    }
})

blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const posts = await prisma.post.findMany({
            select: {
                title: true,
                content: true,
                id: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        });
        return c.json({ posts });
    } catch (error) {
        console.error("Error occurred:", error);
        return c.json({ error: "An error occurred while processing your request." });
    }
});

blogRouter.get('/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const id = c.req.param("id");
        const posts = await prisma.post.findFirst({
            where: {
                id: id,
            },
            select: {
                title: true,
                content: true,
                id: true,
                author: {
                    select: {
                        name: true
                    }
                }
            }
        });
        return c.json({ posts });
    } catch (error) {
        console.error("Error occurred:", error);
        return c.json({ error: "An error occurred while processing your request." });
    }
});