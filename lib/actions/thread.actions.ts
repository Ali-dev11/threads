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
			community: communityIdObject,
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
