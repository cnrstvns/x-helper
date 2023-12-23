'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/pro-regular-svg-icons/faBars';
import { Dialog } from '@headlessui/react';
import { useCallback, useState } from 'react';
import { routes } from './navbar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const MobileMenu = () => {
	const pathName = usePathname();
	const [open, setOpen] = useState(false);

	const handleToggle = useCallback(() => {
		setOpen((openState) => !openState);
	}, []);

	return (
		<div className="flex lg:hidden">
			<div className="relative flex items-center justify-center group">
				<FontAwesomeIcon
					onClick={handleToggle}
					className="dark:text-white/60"
					icon={faBars}
				/>
				<div
					className={cn(
						'h-9 w-9 absolute group-hover:border group-hover:border-neutral-300 group-hover:bg-neutral-200 dark:group-hover:bg-zinc-800 dark:group-hover:border-zinc-700 rounded-md -z-10',
						{
							'bg-neutral-200 dark:bg-zinc-800 border dark:border-zinc-700':
								open,
						},
					)}
				/>
			</div>

			<Dialog open={open} onClose={handleToggle}>
				<div className="flex top-[60px] fixed w-screen items-center justify-center p-1">
					<Dialog.Panel className="w-full px-2 space-y-1 py-3 border shadow-lg rounded-md bg-neutral-50 dark:bg-zinc-900 dark:border-white/10">
						{routes.map((r) => {
							const active = r.href === pathName;

							return (
								<Link
									href={r.href}
									className={cn(
										'px-6 py-1.5 flex cursor-default items-center hover:bg-neutral-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 rounded-md text-neutral-500 hover:text-neutral-900 focus:outline-none',
										{
											'bg-neutral-100 text-neutral-900 dark:bg-zinc-800 dark:text-zinc-300':
												active,
										},
									)}
									key={r.href}
								>
									<div className="h-5 w-5 flex items-center justify-center">
										<FontAwesomeIcon className="mr-5" icon={r.icon} />
									</div>
									<div className="text-sm font-medium">{r.title}</div>
								</Link>
							);
						})}
					</Dialog.Panel>
				</div>
			</Dialog>
		</div>
	);
};

export { MobileMenu };
