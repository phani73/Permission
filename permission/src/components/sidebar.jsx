import React from 'react';
import { FaTh} from 'react-icons/fa';


const sidebar = () => {
const menuItem=[
{
    path:"/permission",
    name:"Permission",
    icon:<FaTh/>
}




]

return(
    <div className='side'>
        <div className="sidebar">

        </div>
        {
            menuItem.map((item,index)=>(
                <NavLink to={item.path} key={index} className="link" activeclassName="active">
                    <div className='icon'>{item.icon}</div>
                </NavLink>
            ))
        }

    </div>
)

}

export default sidebar
