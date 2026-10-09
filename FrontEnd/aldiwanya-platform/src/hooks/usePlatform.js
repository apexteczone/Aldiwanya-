import {useContext} from 'react';
import {PlatformContext} from '../context/platform-context';
export default function usePlatform() {return useContext(PlatformContext);}
