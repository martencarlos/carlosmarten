
import PostCard from './components/PostCard.jsx';
   
   async function getPosts() {
     const res = await fetch('https://www.carlosmarten.com/wp-json/wp/v2/posts?_embed', { next: { revalidate: 60 } });
     return res.json();
   }
   
   export default async function Home() {
    try {
     const posts = await getPosts();
   
     return (
       <main>
         <h1>Latest posts</h1>
         <ul>
           {posts.map((post) => (
             <li key={post.id}>
               
               <PostCard 
                post={post}
                />
             </li>
           ))}
         </ul>
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