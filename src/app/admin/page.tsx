import styles from './admin.module.css';

const AdminPage = () => {
    return (
        <div className={styles['admin-container']}>
            <header className={styles['admin-header']}>
                <h1>Admin Dashboard</h1>
            </header>
            <main className={styles['admin-content']}>
                {/* Admin content goes here */}
            </main>
            <footer className={styles['admin-footer']}>
                <p>Footer Content</p>
            </footer>
        </div>
    );
};

export default AdminPage;