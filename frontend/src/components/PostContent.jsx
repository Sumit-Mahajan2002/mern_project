const PostContent = ({ content }) => {
    if (!content) return <p>No content available</p>; // Prevent error if content is undefined
    return <div className="prose" dangerouslySetInnerHTML={{ __html: content }} />;
  };
  
  export default PostContent;
  