import { useEffect, useState } from 'react';
import { BACKEND_URL } from '../config';
import axios from 'axios';

function Navbar() {
  const [blogs, setBlogs] = useState<{ username: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(`${BACKEND_URL}/api/v1/message/main`,{
        headers: {
          Authorization: localStorage.getItem('token')
        }
      });
      setBlogs(response.data.users);
    };
    fetchData();
  }, []);
  
  return (
    <div className="bg-white text-black w-64 h-full border border-b-black pt-4 pb-4">
      <h2 className="text-lg font-bold  border-b border-b-black pl-4 mb-4">Users</h2>
      <div className="text-black h-full p-4">
        <ul className="space-y-2">
          {blogs.map(blog => (
          <li className="cursor-pointer hover:bg-gray-700 border rounded">
            {blog.username}
          </li>
        ))}
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
