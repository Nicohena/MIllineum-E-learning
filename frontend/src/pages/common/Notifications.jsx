import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const Notifications = () => <MockModulePage {...modulePageMockData.notifications} />;

export default Notifications;
