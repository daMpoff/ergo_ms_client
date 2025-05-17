export const endpoints = {
    auth: {
        login: 'cms/adp/authorization/',
        validateRegistration: 'cms/adp/validate_registration/',
        sendCode: 'cms/adp/send_code/',
        verifyCode: 'cms/adp/verify_code/',
        registration: 'cms/adp/registration/',
        protected: 'cms/adp/protected/',
    },
    crm: {
        tasks: {
            sectionTasks: 'crm/tasks/section-tasks/',
            add_task:'crm/tasks/task-new/',
            add_section:'crm/tasks/section-new/',
            delete_task:'crm/tasks/delete-task/{id}/'
        },
        projects:
        {
            allprojects:'crm/projects/project-all/',
            personalprojects:'crm/projects/project-personal/',
            invitedprojects:'crm/projects/project-invited/',
            addproject:'crm/projects/project-new-add/',
            addprojectuser:'crm/projects/projectuser-new-add/',
        }
    },
    expsys: {
        subjects: {
            allsubjects: '/expsys_module/subjects-all/',
            create:'/expsys_module/subject-create/',
            allcompenencies:'/expsys_module/subjectsindicators/',
            competencies:'/expsys_module/allcompetencies',
        },
    
    },   
}; 