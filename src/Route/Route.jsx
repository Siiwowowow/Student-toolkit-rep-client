import CompleteProfile from "../Pages/SignUp/CompleteProfile";
import StudentProfile from "../Components/Student/StudentProfile";
import { createBrowserRouter } from "react-router";
import Root from "../Root/Root";
import Home from "../Components/Home/Home";
import Schedule from "../Components/Schedule/Schedule";
import Budget from "../Components/Budget/Budget";
import ExamPrep from "../Components/ExamPrep/ExamPrep";
import StudyPlanner from "../Components/StudyPlanner/StudyPlanner";
import SignUp from "../Pages/SignUp/Signup";
import Login from "../Pages/Login/Login";
import AdminRoute from "../Context/AdminRoute";
import AdminDashboard from "../Components/Admin/AdminDashboard";
import AdminOverview from "../Components/Admin/AdminOverview";
import StudentManagement from "../Components/Admin/StudentManagement";
import AdminContentManager from "../Components/Admin/AdminContentManager";
import PrivateRoute from "../Context/PrivateRoute";
import Error from "../Components/Errorpage/Error";
import StudentDashboard from "../Components/Student/StudentDashboard";
import QuizUpdatesManager from "../Components/Admin/QuizUpdatesManager";
import StudentQuizUpdates from "../Components/Student/StudentQuizUpdates";
import FocusMode from "../Components/FocusMode/FocusMode";
import FocusStudyMood from "../Components/FocusStudyMood/FocusStudyMood";
import "../Components/Student/StudyToolsTheme.css";

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement:<Error></Error>,
    element: <Root></Root>,
    children:[
        { path: "/complete-profile", element: <PrivateRoute><CompleteProfile /></PrivateRoute> },
        { path: "/profile", element: <PrivateRoute><StudentProfile /></PrivateRoute> },
        {

            index:true,
            path:'/',
            element:<Home></Home>
        },
        {
          path: '/admin',
          element: <AdminRoute><AdminDashboard /></AdminRoute>,
          children: [
            { index: true, element: <AdminOverview /> },
            { path: "students", element: <StudentManagement /> },
            { path: "quizzes", element: <QuizUpdatesManager /> },
            { path: "announcements", element: <AdminContentManager key="announcements" kind="announcements" /> },
          ],
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
          path: '/focus-mode',
          element: <PrivateRoute><FocusMode /></PrivateRoute>
        },
        {
          path: '/focus-study-mood',
          element: <PrivateRoute><FocusStudyMood /></PrivateRoute>
        },
        {
          path: '/quiz-tracker',
          element: <PrivateRoute><StudentQuizUpdates tracker /></PrivateRoute>
        },
        {
          path: '/student-dashboard/notice-board',
          element: <PrivateRoute><StudentDashboard noticeBoard /></PrivateRoute>
        },
        {
          path: '/student-dashboard/quiz-updates',
          element: <PrivateRoute><StudentDashboard quizUpdates /></PrivateRoute>
        },
        {
          path:'/student-dashboard',
          element:<PrivateRoute><StudentDashboard /></PrivateRoute>
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
