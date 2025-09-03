import { createBrowserRouter } from "react-router";
import Root from "../Root/Root";
import Home from "../Components/Home/Home";
import Schedule from "../Components/Schedule/Schedule";
import Budget from "../Components/Budget/Budget";
import ExamPrep from "../Components/ExamPrep/ExamPrep";
import StudyPlanner from "../Components/StudyPlanner/StudyPlanner";
import SignUp from "../Pages/SignUp/Signup";
import Login from "../Pages/Login/Login";
import AiAssistent from "../Components/AiAssistent/AiAssistent";
import PrivateRoute from "../Context/PrivateRoute";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root></Root>,
    children:[
        {
            index:true,
            path:'/',
            element:<Home></Home>
        },
        {
          path:'/schedule',
          element:<PrivateRoute><Schedule></Schedule></PrivateRoute>
        },
        {
          path:'/budget',
          element:<PrivateRoute><Budget></Budget></PrivateRoute>
        },
        {
          path:'/exam-prep',
          element:<PrivateRoute><ExamPrep></ExamPrep></PrivateRoute>
        },
        {
          path:'/study-planner',
          element:<PrivateRoute><StudyPlanner></StudyPlanner></PrivateRoute>
        },
        {
          path:'/ai-planner',
          element:<PrivateRoute><AiAssistent></AiAssistent></PrivateRoute>
        },
        {
          path:'/signUp',
          element:<SignUp></SignUp>
        },
        {
          path:'/logIn',
          element:<Login></Login>
        },
    ]
  }
]);