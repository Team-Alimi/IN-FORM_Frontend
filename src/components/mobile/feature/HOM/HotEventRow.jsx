const HotEventRow = ({
  category = "기타",
  title = "오류",
  vendor = "미확인",
  start_date = "",
  due_date = "",
  bookmarks = 0,
}) => {
  return (
    <div>
      <div>{category}</div>
      <div>{title}</div>
      <div>{vendor}</div>
      <div>
        <p>{`${start_date} ~ ${due_date}`}</p>
      </div>
      <div>{bookmarks}</div>
    </div>
  );
};
export default HotEventRow;
