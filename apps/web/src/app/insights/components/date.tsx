import { format } from 'date-fns';

interface DateComponentProps {
  dateString: string | undefined;
}
export default function DateComponent({ dateString }: Readonly<DateComponentProps>) {
  if (!dateString) {
    return null;
  }

  return (
    <time dateTime={dateString} className="">
      {format(new Date(dateString), 'LLLL	d, yyyy')}
    </time>
  );
}
