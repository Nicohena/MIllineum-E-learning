import api from './api';

export const contentService = {
  /**
   * Get full course content (chapters, notes, materials)
   */
  getCourseContent: async (courseId) => {
    try {
      const response = await api.get(`/student/course-content?course_id=${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course content:', error);
      throw error;
    }
  },

  /**
   * Create a new chapter
   */
  createChapter: async (courseId, title, orderIndex = 0) => {
    try {
      const response = await api.post('/teacher/chapters', {
        course_id: courseId,
        title,
        order_index: orderIndex
      });
      return response.data;
    } catch (error) {
      console.error('Error creating chapter:', error);
      throw error;
    }
  },

  /**
   * Add a note to a chapter
   */
  addNote: async (chapterId, content, isPublished = true) => {
    try {
      const response = await api.post('/teacher/notes', {
        chapter_id: chapterId,
        content,
        is_published: isPublished
      });
      return response.data;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },

  /**
   * Add material (Learning or Reference)
   */
  addMaterial: async (chapterId, title, materialData) => {
    try {
      const { type, file, url, description } = materialData;
      
      if (type === 'learning' && file) {
        const formData = new FormData();
        formData.append('chapter_id', String(chapterId));
        formData.append('title', title);
        formData.append('type', 'learning');
        formData.append('file', file);
        formData.append('description', description || '');

        // Do not manually set multipart Content-Type; Axios/browser must set boundary.
        const response = await api.post('/teacher/materials', formData);
        return response.data;
      }

      if (type === 'reference') {
        const response = await api.post('/teacher/materials', {
          chapter_id: chapterId,
          title,
          type: 'reference',
          url_or_link: url,
          source_type: 'link'
        });
        return response.data;
      }

      throw new Error('A file is required for learning materials.');
    } catch (error) {
      console.error('Error adding material:', error);
      throw error;
    }
  },

  /**
   * Publish all content for a course
   */
  publishCourseContent: async (courseId) => {
    try {
      const response = await api.post('/teacher/publish-content', {
        course_id: courseId
      });
      return response.data;
    } catch (error) {
      console.error('Error publishing content:', error);
      throw error;
    }
  }
};

export default contentService;
