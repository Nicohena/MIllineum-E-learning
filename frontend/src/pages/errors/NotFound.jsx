import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const NotFound = () => <MockModulePage {...modulePageMockData.notFound} />;

export default NotFound;
