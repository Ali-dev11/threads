'use server'

import {revalidatePath} from 'next/cache'

import Community from '../models/community.model'
import User from '../models/user.model'
import {connectToDB} from '../mongoose'
import Thread from '../models/thread.model'

interface Params {
	text: string
	author: string
	communityId: string | null
	path: string
}

export async function createThread({text, author, communityId, path}: Params) {
	try {
		connectToDB()

		const communityIdObject = await Community.findOne(
			{id: communityId},
			{_id: 1}
		)

		const createdThread = await Thread.create({
			text,
			author,
			community: null,
		})

		await User.findByIdAndUpdate(author, {
			$push: {threads: createdThread._id},
		})

		if (communityIdObject) {
			await Community.findByIdAndUpdate(communityIdObject, {
				$push: {threads: createdThread._id},
			})
		}

		revalidatePath(path)
	} catch (error: any) {
		throw new Error(`Failed to create thread: ${error.message}`)
	}
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
	try {
		connectToDB()

		const skipAmount = (pageNumber - 1) * pageSize

		const postsQuery = Thread.find({parentId: {$in: [null, undefined]}})
			.sort({createdAt: 'desc'})
			.skip(skipAmount)
			.limit(pageSize)
			.populate({
				path: 'author',
				model: User,
			})
			.populate({
				path: 'children',
				populate: {
					path: 'author',
					model: User,
					select: '_id name parentId image',
				},
			})

		const totalPostsCount = await Thread.countDocuments({
			parentId: {$in: [null, undefined]},
		})

		const posts = await postsQuery.exec()

		const isNext = totalPostsCount > skipAmount + posts.length

		return {posts, isNext}
	} catch (error: any) {
		throw new Error(`Failed to fetch posts: ${error.message}`)
	}
}
