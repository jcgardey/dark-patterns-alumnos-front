import { CheckIcon } from '../Icons/CheckIcon';

export const OrderItem = ({ description }) => (
  <div className="flex justify-between my-2">
    <CheckIcon />
    <p className="w-3/4">{description}</p>
  </div>
);
