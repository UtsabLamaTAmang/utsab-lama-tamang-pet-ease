import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all blogs
export const getAllBlogs = async (req, res) => {
    try {
        const { category, published, search } = req.query;

        const where = {};
        if (category) where.category = category;
        if (published === "true") where.published = true;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
            ];
        }

        const blogs = await prisma.blog.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json({
            success: true,
            data: blogs,
        });
    } catch (error) {
        console.error("Get blogs error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch blogs",
            error: error.message,
        });
    }
};

// Get single blog
export const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await prisma.blog.findUnique({
            where: { id: parseInt(id) },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        // Increment views
        await prisma.blog.update({
            where: { id: parseInt(id) },
            data: {
                views: {
                    increment: 1,
                },
            },
        });

        res.json({
            success: true,
            data: blog,
        });
    } catch (error) {
        console.error("Get blog error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch blog",
            error: error.message,
        });
    }
};

// Create blog (admin only)
export const createBlog = async (req, res) => {
    try {
        const authorId = req.user.id;
        const { title, content, excerpt, category, coverImage, tags, published } =
            req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required",
            });
        }

        const blog = await prisma.blog.create({
            data: {
                title,
                content,
                excerpt,
                category,
                coverImage,
                tags: tags || [],
                published: published === true || published === "true",
                authorId,
            },
            include: {
                author: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            data: blog,
        });
    } catch (error) {
        console.error("Create blog error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create blog",
            error: error.message,
        });
    }
};

// Update blog (admin only)
export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await prisma.blog.update({
            where: { id: parseInt(id) },
            data: req.body,
            include: {
                author: {
                    select: {
                        fullName: true,
                        email: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            message: "Blog updated successfully",
            data: blog,
        });
    } catch (error) {
        console.error("Update blog error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update blog",
            error: error.message,
        });
    }
};

// Delete blog (admin only)
export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.blog.delete({
            where: { id: parseInt(id) },
        });

        res.json({
            success: true,
            message: "Blog deleted successfully",
        });
    } catch (error) {
        console.error("Delete blog error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete blog",
            error: error.message,
        });
    }
};
