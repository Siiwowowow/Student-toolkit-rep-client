import { createBrowserRouter } from "react-router";
import Root from "../Root/Root";
import Home from "../Components/Home/Home";
import Schedule from "../Components/Schedule/Schedule";
import Budget from "../Components/Budget/Budget";
import ExamPrep from "../Components/ExamPrep/ExamPrep";
import StudyPlanner from "../Components/StudyPlanner/StudyPlanner";
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
          element:<Schedule></Schedule>
        },
        {
          path:'/budget',
          element:<Budget></Budget>
        },
        {
          path:'/exam-pep',
          element:<ExamPrep></ExamPrep>
        },
        {
          path:'/study-planer',
          element:<StudyPlanner></StudyPlanner>
        },
    ]
  }
]);