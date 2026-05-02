import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const AttendanceMark = () => <MockModulePage {...modulePageMockData.attendanceMark} />;

export default AttendanceMark;
