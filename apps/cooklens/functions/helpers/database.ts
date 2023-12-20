import { connect } from 'mongoose';

export async function connectDB(url?: string): Promise<void> {
  if (!url) {
    console.log('No database url provided');
    return Promise.reject();
  }
  await connect(url).then(
    () => console.log('Database connected'),
    (error) => console.log('Error connecting to database. ', error)
  );
}
