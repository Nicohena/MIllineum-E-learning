import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const GradingView = () => <MockModulePage {...modulePageMockData.gradingView} />;

export default GradingView;
