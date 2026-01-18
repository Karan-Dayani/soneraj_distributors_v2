const Error = (props: { error: string }) => {
  return (
    <div className="w-full flex items-center justify-center py-10">
      <div className="text-red-500 font-medium">{props.error}</div>
    </div>
  );
};

export default Error;
