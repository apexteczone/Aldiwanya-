import {useParams} from 'react-router-dom';
import useResource from '../../hooks/useResource';
import {ResourceState} from '../../components/common/PlatformUI';
import {CourseView} from '../courses/CourseDetailsPage';
function LessonCourse({lesson}){
 const resource=useResource('/courses/'+lesson.courseId);
 return <ResourceState resource={resource}>{resource.data&&<CourseView key={lesson._id} course={resource.data} initialLessonId={lesson._id}/>}</ResourceState>;
}
export default function LessonPage(){
 const {id}=useParams(),resource=useResource('/lessons/'+id);
 return <ResourceState resource={resource}>{resource.data&&<LessonCourse lesson={resource.data.lesson}/>}</ResourceState>;
}
