import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const AssignmentSubmit = () => <MockModulePage {...modulePageMockData.assignmentSubmit} />;

export default AssignmentSubmit;
