import { redirect } from 'next/navigation';
import connectDB from '@/libs/mongoose';
import User from '@/models/User';

interface PageProps {
  params: {
    username: string;
  };
}

export default async function UsernamePage({ params }: PageProps) {
  const { username } = params;
  
  try {
    await connectDB();
    
    // Find user by username (exact match)
    const user = await User.findOne({
      username: username.toLowerCase()
    }).select('_id');
    
    if (user) {
      // Redirect to the full dancer profile
      redirect(`/dancer/${user._id}`);
    } else {
      // Username not found, redirect to home with a message
      redirect('/?error=user-not-found');
    }
  } catch (error) {
    console.error('Error finding user:', error);
    redirect('/?error=server-error');
  }
} 