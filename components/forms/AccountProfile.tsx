'use client'

import * as z from 'zod'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormDescription,
} from '@/components/ui/form'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import {UserValidation} from '@/lib/validations/user'

interface Props {
	user: {
		id: string
		objectId: string
		username: string
		name: string
		bio: string
		image: string
	}
	btnTitle: string
}

const AccountProfile = ({user, btnTitle}: Props) => {
	const form = useForm<z.infer<typeof UserValidation>>({
		resolver: zodResolver(UserValidation),
		defaultValues: {
			profile_photo: '',
			name: '',
			username: '',
			bio: '',
		},
	})

	return (
		<Form {...form}>
			<form className='space-y-8'>
				<FormField
					control={form.control}
					name='username'
					render={({field}) => (
						<FormItem>
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input
									placeholder='shadcn'
									{...field}
								/>
							</FormControl>
							<FormDescription>
								This is your public display name.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type='submit'>Submit</Button>
			</form>
		</Form>
	)
}

export default AccountProfile
