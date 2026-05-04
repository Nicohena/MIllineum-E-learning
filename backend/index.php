<?php

/**
 * Millennium School E-Learning API
 * Master Entry Point & Router
 */

// Load .env file into environment
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        
        [$key, $value] = explode('=', $line, 2);
        $key   = trim($key);
        $value = trim($value);
        
        // Strip surrounding quotes
        if (preg_match('/^(["\'])(.*)\1$/', $value, $m)) {
            $value = $m[2];
        }
        
        putenv("$key=$value");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

// COMMIT_MARKER: touched for repository commit (no functional change)

// Debug log
file_put_contents(__DIR__ . '/request.log', date('[Y-m-d H:i:s] ') . $_SERVER['REQUEST_METHOD'] . ' ' . $_SERVER['REQUEST_URI'] . "\n", FILE_APPEND);

// 1. Set CORS Headers (Crucial for React <-> PHP communication)
header('Access-Control-Allow-Origin: *'); // In production, replace * with your frontend domain
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Autoloading (Simple logic for now, using project structure)
spl_autoload_register(function ($class) {
    $class = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    $file = __DIR__ . DIRECTORY_SEPARATOR . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

// 3. Simple API Routing
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri_parts = explode('/', trim($uri, '/'));

// Expected URI format: /api/{resource}/{id}
// For now, simplify for local development if running directly in the backend folder
$api_index = array_search('api', $uri_parts);
$resource = $uri_parts[$api_index + 1] ?? 'status';
$id = $uri_parts[$api_index + 2] ?? null;

// Basic Router logic
switch ($resource) {
    case 'status':
        echo json_encode([
            'status' => 'online',
            'version' => '1.0.0',
            'message' => 'Millennium School E-Learning API is running.'
        ]);
        break;

    case 'auth':
        $controller = new \Controllers\AuthController();
        if ($id === 'login') {
            $controller->login();
        } elseif ($id === 'register') {
            $controller->register();
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Auth action not found']);
        }
        break;

    case 'classes':
        $controller = new \Controllers\AdminController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            echo json_encode([
                'status' => 'success',
                'classes' => (new \Models\ClassModel())->getAll()
            ]);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->createClass();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $controller->deleteClass();
        }
        break;

    case 'subjects':
        $controller = new \Controllers\AdminController();
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            echo json_encode([
                'status' => 'success',
                'subjects' => (new \Models\Subject())->getAll()
            ]);
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->createSubject();
        } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $controller->deleteSubject();
        }
        break;

    case 'admin':
        $controller = new \Controllers\AdminController();
        if ($id === 'overview' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getOverview();
        } elseif ($id === 'users' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->listUsers();
        } elseif ($id === 'years' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->listYears();
        } elseif ($id === 'years' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->createYear();
        } elseif ($id === 'years' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $controller->deleteYear();
        } elseif ($id === 'assignments' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->listAssignments();
        } elseif ($id === 'assign' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->assignTeacher();
        } elseif ($id === 'assign-student' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->assignStudentToClass();
        } elseif ($id === 'active-year' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->setActiveYear();
        } elseif ($id === 'reset-password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->resetUserPassword();
        } elseif ($id === 'subject-teachers' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->addTeachersToSubject();
        } elseif ($id === 'subject-teachers' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $controller->removeTeacherFromSubject();
        } elseif ($id === 'users') {
            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                $controller->getUsers();
            } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $controller->createUser();
            } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
                $controller->updateUserStatus();
            } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
                $controller->deleteUser();
            }
        }
        break;

    case 'student':
        $controller = new \Controllers\StudentController();
        if ($id === 'schedule' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getSchedule();
        } elseif ($id === 'course-content' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getCourseContent();
        } elseif ($id === 'grades' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getGrades();
        }
        break;

    case 'teacher':
        $controller = new \Controllers\TeacherController();
        if ($id === 'courses' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getMyCourses();
        } elseif ($id === 'chapters' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->createChapter();
        } elseif ($id === 'notes' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->addNote();
        } elseif ($id === 'materials' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->addMaterial();
        } elseif ($id === 'publish-content' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->publishCourseContent();
        }
        break;

    case 'courses':
        // CourseController handler will go here
        echo json_encode(['message' => 'Courses route hit']);
        break;

    case 'assignments':
        $controller = new \Controllers\AssignmentController();
        // Teacher routes
        if ($id === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->createAssignment();
        } elseif ($id === 'my-assignments' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getMyAssignments();
        } elseif ($id === 'submissions' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getSubmissions();
        } elseif ($id === 'grade' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->gradeSubmission();
        } elseif ($id === 'recent-submissions' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getRecentSubmissions();
        } elseif ($id === 'delete' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $controller->deleteAssignment();
        }
        // Student routes
        elseif ($id === 'student' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getStudentAssignments();
        } elseif ($id === 'submit' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->submitAssignment();
        }
        break;
    
    case 'messages':
        $controller = new \Controllers\MessageController();
        if ($id === 'conversations' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getConversations();
        } elseif ($id === 'chat' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getMessages();
        } elseif ($id === 'send' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->sendMessage();
        } elseif ($id === 'unread' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getUnreadCount();
        } elseif ($id === 'contacts' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getContacts();
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Resource not found: ' . $resource]);
        break;
}
