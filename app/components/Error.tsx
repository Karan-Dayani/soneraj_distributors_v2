const Error = (props: { error: string }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="text-red-500">{props.error}</div>
    </div>
  );
};

export default Error;
