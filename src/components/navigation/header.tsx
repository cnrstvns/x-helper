import { cn } from '@/lib/utils';
import { Search } from '../ui/search';
import { UserButton } from '@clerk/nextjs';

type HeaderProps = {
	className?: string;
	searchPlaceholder?: string;
	profile?: boolean;
};

const Header = ({ searchPlaceholder, profile, className }: HeaderProps) => {
	return (
		<div
			className={cn(
				'w-full lg:w-[calc(100%-250px)] fixed top-0 z-50 flex items-center px-4 bg-gray-50 h-[60px] border-b',
				{
					'justify-between': searchPlaceholder && profile,
					'justify-end': !searchPlaceholder && profile,
				},
				className,
			)}
		>
			{searchPlaceholder && <Search placeholder={searchPlaceholder} />}
			{profile && <UserButton />}
		</div>
	);
};

export { Header };
