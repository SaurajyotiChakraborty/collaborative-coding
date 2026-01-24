import { UserProfile } from '@/components/profile/user-profile';

export default function PublicProfilePage({ params }: { params: { username: string } }) {
    return <UserProfile userId={params.username} />;
}
