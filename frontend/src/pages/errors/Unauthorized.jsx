import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const Unauthorized = () => <MockModulePage {...modulePageMockData.unauthorized} />;

export default Unauthorized;
