
import styles from './page.module.css';
import PostList from './components/PostList/PostList'
import Hero from './components/Hero/Hero';
   

   export default async function Home() {
    try {
     
   
    return (
      <main>
        <Hero />
        <PostList />
      </main>
     );
    } catch (error) {
      return (
        <div>
          <h1>Error</h1>
          <p>Failed to load the blog posts. Please try again later.</p>
        </div>
      );
    }
   }