import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const ForumManage = () => <MockModulePage {...modulePageMockData.forumManage} />;

export default ForumManage;
