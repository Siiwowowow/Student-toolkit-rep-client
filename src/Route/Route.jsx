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
import Error from "../Components/Errorpage/Error";
import Remainder from "../Components/Reminder/Remainder";
export const router = createBrowserRouter([
  {
    path: "/",
    errorElement:<Error></Error>,
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
          element:<ExamPrep></ExamPrep>
        },
        {
          path:'/study-planner',
          element:<PrivateRoute><StudyPlanner></StudyPlanner></PrivateRoute>
        },
        {
          path:'/ai-planner',
          element:<AiAssistent></AiAssistent>
        },
        {
          path:'/remainder',
          element:<Remainder></Remainder>
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