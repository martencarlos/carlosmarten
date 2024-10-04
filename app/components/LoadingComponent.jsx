export default function LoadingComponent() {
  return (
    <div style={styles.loadingContainer}>
      <h1 style={styles.text}>Loading...</h1>
    </div>
  );
}

const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  },
  text: {
    fontSize: '24px',
    fontWeight: 'bold'
  }
};